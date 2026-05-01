import React from "react";
import { View, FlatList, StyleSheet } from "react-native";

import CategoryCard from "./CategoryCard";

import { useSupabaseCategories } from "@shared/hooks/useSupabaseCategories";
import { Category } from "@shared/types/data";

interface CategoryListProps {
  activeId: string;
  onSelectCategory: (id: string) => void;
}

const Separator = () => <View style={{ width: 12 }} />;

const CategoryList: React.FC<CategoryListProps> = ({
  activeId,
  onSelectCategory,
}) => {
  const { categories } = useSupabaseCategories();

  return (
    <FlatList
      data={categories as Category[]}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <CategoryCard
          label={item.label}
          icon={item.icon}
          active={item.id === activeId}
          onPress={() => onSelectCategory(item.id)}
        />
      )}
    />
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  listContent: { paddingVertical: 8 },
});
