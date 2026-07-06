INSERT INTO emission_factors (activity_type, category, emission_factor, unit) VALUES
('transport', 'Transport', 0.2, 'kg/km'),
('flight', 'Transport', 0.15, 'kg/km'),
('energy', 'Electricity', 0.5, 'kg/kWh'),
('food', 'Food', 2.0, 'kg/meal'),
('shopping', 'Shopping', 5.0, 'kg/item')
ON CONFLICT DO NOTHING;
