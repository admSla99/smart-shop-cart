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
} from 'react-native';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { palette } from '../theme/colors';
import { supabase } from '../lib/supabase';
import type { ShopLayoutTemplate } from '../types';

type TemplateGroup = {
  key: string;
  shop_name: string;
  template_name: string;
  areas: ShopLayoutTemplate[];
  ids: string[];
};

const TemplatesScreen: React.FC = () => {
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.card}>
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

        <Button label={editingKey ? 'Save changes' : 'Add template'} onPress={handleSubmit} loading={saving} />
        {editingKey ? (
          <Button label="Cancel editing" variant="ghost" onPress={resetForm} disabled={saving} />
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Existing templates</Text>
          {loading ? <ActivityIndicator color={palette.accent} /> : null}
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
              <View>
                <Text style={styles.templateTitle}>{group.template_name}</Text>
                <Text style={styles.templateSubtitle}>{group.shop_name}</Text>
              </View>
              <View style={styles.templateActions}>
                <Button label="Edit" variant="secondary" onPress={() => startEditing(group)} />
                <Button
                  label="Delete"
                  variant="ghost"
                  onPress={() => confirmDelete(group)}
                  disabled={saving}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: palette.background,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: palette.muted,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text,
    marginBottom: 12,
    backgroundColor: palette.card,
  },
  textArea: {
    minHeight: 100,
  },
  error: {
    color: palette.danger,
    marginBottom: 8,
  },
  editingHint: {
    color: palette.muted,
    marginBottom: 8,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: palette.card,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateTitle: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 16,
  },
  templateSubtitle: {
    color: palette.muted,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaChip: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  areaChipLabel: {
    color: palette.text,
    fontWeight: '600',
  },
});

export default TemplatesScreen;
