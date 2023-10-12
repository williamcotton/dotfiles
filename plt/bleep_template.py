import sourcetypes

template_str: sourcetypes.python = """
y_{{ command['y_fieldname'] }}_value = [float(y) for y in data['{{ command['y_fieldname'] }}']]
ax.plot(x_value, y_{{ command['y_fieldname'] }}_value, color='{{ command['color'] }}', linestyle='{{ command['draw_style'] }}', linewidth={{ command['width'] }})
"""


def parser(p):
    return {"color": p[3], "width": p[4], "draw_style": "solid"}
