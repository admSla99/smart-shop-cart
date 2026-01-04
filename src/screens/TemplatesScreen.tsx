import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { EmptyState } from '../components/EmptyState';
import { FadeInView } from '../components/FadeInView';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import type { ShopLayoutTemplate } from '../types';
import type { Layout } from '../theme/layout';
import type { Palette } from '../theme/colors';
import type { Typography } from '../theme/typography';

type TemplateGroup = {
  key: string;
  shop_name: string;
  template_name: string;
  areas: ShopLayoutTemplate[];
  ids: string[];
};

const TemplatesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { palette, typography, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(palette, typography, layout),
    [palette, typography, layout],
  );
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ShopLayoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [areasInput, setAreasInput] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingIds, setEditingIds] = useState<string[]>([]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('shop_layout_templates')
        .select('*')
        .order('shop_name', { ascending: true })
        .order('template_name', { ascending: true })
        .order('sequence', { ascending: true });
      if (fetchError) {
        throw fetchError;
      }
      setTemplates(data ?? []);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates]),
  );

  const groupedTemplates = useMemo<TemplateGroup[]>(() => {
    const groups: Record<string, TemplateGroup> = {};
    templates.forEach((template) => {
      const key = `${template.shop_name}::${template.template_name}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          shop_name: template.shop_name,
          template_name: template.template_name,
          areas: [],
          ids: [],
        };
      }
      groups[key].areas.push(template);
      groups[key].ids.push(template.id);
    });
    return Object.values(groups).map((group) => ({
      ...group,
      areas: group.areas.sort((a, b) => a.sequence - b.sequence),
    }));
  }, [templates]);

  const resetForm = () => {
    setShopName('');
    setTemplateName('');
    setAreasInput('');
    setFormError(null);
    setEditingKey(null);
    setEditingIds([]);
  };

  const parseAreas = (input: string) => {
    const seen = new Set<string>();
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => {
        if (!line) return false;
        const lower = line.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
  };

  const confirmDelete = (group: TemplateGroup) => {
    const message = `Delete template "${group.template_name}" for ${group.shop_name}?`;
    const performDelete = async () => {
      setSaving(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('shop_layout_templates')
          .delete()
          .in('id', group.ids);
        if (deleteError) {
          throw deleteError;
        }
        await loadTemplates();
        if (editingKey === group.key) {
          resetForm();
        }
      } catch (err) {
        setError((err as Error)?.message ?? 'Unable to delete template');
      } finally {
        setSaving(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmFn =
        typeof globalThis !== 'undefined' && typeof (globalThis as { confirm?: (msg?: string) => boolean }).confirm === 'function'
          ? (globalThis as { confirm: (msg?: string) => boolean }).confirm
          : undefined;
      if (!confirmFn || confirmFn(message)) {
        performDelete();
      }
      return;
    }

    Alert.alert('Delete template', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  };

  const handleSubmit = async () => {
    if (!user) {
      setFormError('You need to be signed in to manage templates.');
      return;
    }
    const trimmedShop = shopName.trim();
    const trimmedTemplate = templateName.trim();
    const areas = parseAreas(areasInput);
    if (!trimmedShop || !trimmedTemplate) {
      setFormError('Shop and template names are required.');
      return;
    }
    if (areas.length === 0) {
      setFormError('Add at least one area (one per line).');
      return;
    }

    setSaving(true);
    setFormError(null);
    setError(null);

    try {
      const records = areas.map((area, idx) => ({
        shop_name: trimmedShop,
        template_name: trimmedTemplate,
        area_name: area,
        sequence: idx + 1,
      }));

      if (editingIds.length) {
        const { error: deleteError } = await supabase
          .from('shop_layout_templates')
          .delete()
          .in('id', editingIds);
        if (deleteError) {
          throw deleteError;
        }
      }

      const { error: insertError } = await supabase.from('shop_layout_templates').insert(records);
      if (insertError) {
        throw insertError;
      }

      await loadTemplates();
      resetForm();
    } catch (err) {
      setFormError((err as Error)?.message ?? 'Unable to save template');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (group: TemplateGroup) => {
    setShopName(group.shop_name);
    setTemplateName(group.template_name);
    setAreasInput(group.areas.map((area) => area.area_name).join('\n'));
    setEditingKey(group.key);
    setEditingIds(group.ids);
    setFormError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
    >
      <DecorativeBackground variant="cool" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <FadeInView style={styles.card}>
          <Text style={styles.sectionTitle}>Template manager</Text>
          <Text style={styles.sectionSubtitle}>
            Create or edit store templates used for layout sorting.
          </Text>

          <Text style={styles.inputLabel}>Shop name</Text>
          <TextInput
            value={shopName}
            onChangeText={setShopName}
            placeholder="e.g. Lidl"
            placeholderTextColor={palette.muted}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Template name</Text>
          <TextInput
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="e.g. Default"
            placeholderTextColor={palette.muted}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Areas (one per line)</Text>
          <TextInput
            value={areasInput}
            onChangeText={setAreasInput}
            placeholder={`Produce\nBakery\nCheckout`}
            placeholderTextColor={palette.muted}
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          {editingKey ? (
            <Text style={styles.editingHint}>
              Editing {templateName || 'template'} for {shopName || 'shop'}
            </Text>
          ) : null}

          <Button
            label={editingKey ? 'Save changes' : 'Add template'}
            icon={editingKey ? 'save' : 'plus'}
            onPress={handleSubmit}
            loading={saving}
            style={{ marginTop: 16 }}
          />
          {editingKey ? (
            <Button
              label="Cancel editing"
              icon="x-circle"
              variant="ghost"
              onPress={resetForm}
              disabled={saving}
              style={{ marginTop: 8 }}
            />
          ) : null}
        </FadeInView>

        <FadeInView delay={120} style={styles.card}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Existing templates</Text>
            {loading ? <ActivityIndicator color={palette.primary} /> : null}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!loading && groupedTemplates.length === 0 ? (
            <EmptyState
              title="No templates yet"
              description="Create a template above to make it available in lists."
            />
          ) : null}
          {groupedTemplates.map((group) => (
            <View key={group.key} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View style={styles.templateInfo} testID={`template-info-${group.key}`}>
                  <Text
                    style={styles.templateTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {group.template_name}
                  </Text>
                  <Text
                    style={styles.templateSubtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {group.shop_name}
                  </Text>
                </View>
                <View style={styles.templateActions} testID={`template-actions-${group.key}`}>
                  <Button
                    variant="secondary"
                    icon="edit-3"
                    compact
                    iconOnly
                    accessibilityLabel={`Edit ${group.template_name}`}
                    onPress={() => startEditing(group)}
                    style={styles.templateActionButton}
                  />
                  <Button
                    variant="ghost"
                    icon="trash-2"
                    compact
                    iconOnly
                    accessibilityLabel={`Delete ${group.template_name}`}
                    onPress={() => confirmDelete(group)}
                    disabled={saving}
                    style={styles.templateActionButton}
                  />
                </View>
              </View>
              <View style={styles.areaList}>
                {group.areas.map((area) => (
                  <View key={area.id} style={styles.areaChip}>
                    <Text style={styles.areaChipLabel}>
                      {area.sequence}. {area.area_name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (palette: Palette, typography: Typography, layout: Layout) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
      position: 'relative',
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'transparent',
      zIndex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: layout.borderRadius.xl,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: palette.border,
      ...layout.shadows.medium,
    },
    sectionTitle: {
      ...typography.h3,
      marginBottom: 4,
    },
    sectionSubtitle: {
      ...typography.body,
      color: palette.textSecondary,
      marginBottom: 20,
    },
    inputLabel: {
      ...typography.label,
      color: palette.textSecondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: layout.borderRadius.l,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: palette.text,
      marginBottom: 16,
      backgroundColor: palette.surface,
      ...layout.shadows.small,
    },
    textArea: {
      minHeight: 120,
    },
    error: {
      ...typography.caption,
      color: palette.danger,
      marginBottom: 16,
    },
    editingHint: {
      ...typography.caption,
      color: palette.textSecondary,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    templateCard: {
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: layout.borderRadius.l,
      padding: 16,
      marginBottom: 12,
      backgroundColor: palette.surface,
      ...layout.shadows.small,
    },
    templateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    templateInfo: {
      flex: 1,
      minWidth: 0,
      marginRight: 12,
    },
    templateTitle: {
      ...typography.h3,
      fontSize: 16,
      flexShrink: 1,
    },
    templateSubtitle: {
      ...typography.body,
      color: palette.textSecondary,
      fontSize: 14,
      flexShrink: 1,
    },
    templateActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    templateActionButton: {
      width: 36,
      height: 36,
      marginVertical: 0,
    },
    areaList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    areaChip: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: layout.borderRadius.m,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    areaChipLabel: {
      ...typography.caption,
      fontWeight: '600',
    },
  });

export default TemplatesScreen;
