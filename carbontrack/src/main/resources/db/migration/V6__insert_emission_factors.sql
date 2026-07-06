INSERT INTO emission_factors
(category, activity_type, unit, emission_factor, source)
VALUES

-- TRANSPORT
('Transport', 'Car', 'km', 0.1920, 'EPA'),
('Transport', 'Bus', 'km', 0.0890, 'EPA'),
('Transport', 'Train', 'km', 0.0410, 'EPA'),
('Transport', 'Flight', 'km', 0.2550, 'EPA'),

-- ELECTRICITY
('Electricity', 'Grid Electricity', 'kWh', 0.8200, 'EPA'),
('Electricity', 'Solar', 'kWh', 0.0500, 'EPA'),

-- FOOD
('Food', 'Vegetarian Meal', 'serving', 0.9000, 'Research'),
('Food', 'Chicken Meal', 'serving', 2.5000, 'Research'),
('Food', 'Beef Meal', 'serving', 27.0000, 'Research'),

-- SHOPPING
('Shopping', 'Clothing', 'Rs', 0.0020, 'Estimated'),
('Shopping', 'Electronics', 'Rs', 0.0050, 'Estimated'),
('Shopping', 'Furniture', 'Rs', 0.0030, 'Estimated');