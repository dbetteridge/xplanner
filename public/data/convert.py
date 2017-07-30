import json
from shapely.geometry import shape

timestamps = []
with open('./-.txt', 'r') as f:
    for line in f:
        timestamps.append(line[:-1])

with open('./suburbs.json', 'r') as s:
    suburbs = json.load(s)

suburbfeat = []
#print(suburbs['features'])
for suburb in suburbs['features']:
    polygon = shape(suburb['geometry'])
    point = polygon.centroid
    suburbfeat.append([point.x,point.y])

for index,value in enumerate(suburbs['features']):
    suburbs['features'][index]['geometry']['coordinates'] = suburbfeat[index]
    suburbs['features'][index]['geometry']['type'] = "Point"

with open('./pins.json', 'w') as output:
    json.dump(suburbs, output)