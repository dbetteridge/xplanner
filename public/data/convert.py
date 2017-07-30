import json
from shapely.geometry import shape
import random

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

newfeatures = []
for index,value in enumerate(suburbs['features']):
    if(index < 500):
        suburbs['features'][index]['geometry']['coordinates'] = suburbfeat[index]
        suburbs['features'][index]['geometry']['type'] = "Point"
        properties = suburbs['features'][index]['properties']        
        properties['PH'] = 7
        properties['clay'] = 10
        properties['silt'] = 10
        properties['sand'] = 60
        properties['limenv'] = 10
        properties['limematerial'] = ""
        properties['limecoverage'] = 200
        properties['comment'] = ""
        
        index2 = random.randrange(len(timestamps)/2, len(timestamps))
   
        properties['timestamp'] = timestamps[index2]
        suburbs['features'][index]['properties'] = properties
        newfeatures.append(suburbs['features'][index])
suburbs['features'] = newfeatures
with open('./pins.json', 'w') as output:
    json.dump(suburbs, output)