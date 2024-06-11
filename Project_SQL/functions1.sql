CREATE OR REPLACE FUNCTION get_food_types(food_id INT)
RETURNS TABLE (type_name VARCHAR(50)) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE food_type_hierarchy AS (
    SELECT food_type.id::INT, food_type.type_name, ARRAY[]::INT[] AS parent_ids
    FROM food_type
    WHERE food_type.id IN (
      SELECT fft.type_id
      FROM food_food_type AS fft
      WHERE fft.food_id = get_food_types.food_id
    )
  UNION ALL
    SELECT ft.id::INT, ft.type_name, ftr.parent_type_id || fth.parent_ids
    FROM food_type_hierarchy AS fth
    JOIN food_type_recursive AS ftr ON fth.id = ftr.child_type_id
    JOIN food_type AS ft ON ftr.parent_type_id = ft.id
  )
  SELECT DISTINCT combined_types.type_name
  FROM (
    SELECT food_type_hierarchy.id AS type_id, food_type_hierarchy.type_name
    FROM food_type_hierarchy
    WHERE food_type_hierarchy.id IN (
      SELECT fft.type_id
      FROM food_food_type AS fft
      WHERE fft.food_id = get_food_types.food_id
    )
    UNION ALL
    SELECT unnest(parent_ids) AS type_id, food_type_hierarchy.type_name
    FROM food_type_hierarchy
  ) AS combined_types;
END;
$$ LANGUAGE plpgsql;






