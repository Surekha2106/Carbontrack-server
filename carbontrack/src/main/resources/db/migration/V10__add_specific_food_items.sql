INSERT INTO emission_factors (category, activity_type, unit, emission_factor)
VALUES 
    ('Food', 'chicken_biryani', 'meal', 2.5),
    ('Food', 'mutton_biryani', 'meal', 4.0),
    ('Food', 'tiffin', 'meal', 0.5),
    ('Food', 'veg_meals', 'meal', 1.5),
    ('Food', 'dosa', 'meal', 0.3),
    ('Food', 'pizza', 'meal', 1.2),
    ('Food', 'burger', 'meal', 2.0),
    ('Food', 'tea_coffee', 'meal', 0.1)
ON CONFLICT DO NOTHING;
