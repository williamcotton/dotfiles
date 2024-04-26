import sourcetypes

template_str: sourcetypes.python = """
y_{{ command['y_fieldname'] }}_value = [float(y) for y in data['{{ command['y_fieldname'] }}']]
x_value_numeric = [float(x) for x in x_value]
ax.scatter(x_value, y_{{ command['y_fieldname'] }}_value, color='{{ command['color'] }}', linestyle='{{ command['draw_style'] }}', linewidth={{ command['width'] }})

# Determine the range for x and y that encompasses both the scatter plot and the line plot
min_val = min(min(x_value_numeric), min(y_{{ command['y_fieldname'] }}_value))
max_val = max(max(x_value_numeric), max(y_{{ command['y_fieldname'] }}_value))

# Expand the range slightly to ensure visibility of all points and lines
margin = (max_val - min_val) * 0.1
min_val -= margin
max_val += margin

# Now plot the x = y line within the same range
x_line = np.linspace(start=min_val, stop=max_val, num=1000)
y_line = x_line
ax.plot(x_line, y_line, label='x = y')

# Set the same limits for x and y axes to maintain the 1:1 aspect ratio
ax.set_xlim(min_val, max_val)
ax.set_ylim(min_val, max_val)
"""
