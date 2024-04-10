import sourcetypes


template_str: sourcetypes.python = """
import pandas as pd
from sklearn.linear_model import LinearRegression

# Prepare the data
df = pd.DataFrame(data)
X = df[['{{ command['x_fieldname'] }}']].astype(float)
y = df['{{ command['y_fieldname'] }}'].astype(float)

# Perform linear regression
model = LinearRegression()
model.fit(X, y)
trend = model.predict(X)

# Plotting
plt.figure(figsize=(10, 6))
plt.scatter(X, y, color='{{ command['color'] }}', label='Actual Data', linestyle='{{ command['draw_style'] }}', linewidth={{ command['width'] }})
plt.plot(X, trend, color='{{ command['color'] }}', label='Trend Line', linestyle='{{ command['draw_style'] }}', linewidth={{ command['width'] }})
plt.xlabel('{{ command['x_fieldname'] }}')
plt.ylabel('{{ command['y_fieldname'] }}')
plt.legend()
"""
