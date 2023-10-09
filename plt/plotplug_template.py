import sourcetypes

template_str: sourcetypes.python = """
y_{{ command['y_fieldname'] }}_value = [float(y) for y in data['{{ command['y_fieldname'] }}']]
ax.plot(x_value, y_{{ command['y_fieldname'] }}_value, color='{{ command['color'] }}', linestyle='{{ command['draw_style'] }}', linewidth={{ command['width'] }})
"""
