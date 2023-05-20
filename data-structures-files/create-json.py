import requests
import json
import unidecode

url = "https://api.sampleapis.com/wines/reds"

headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

response = requests.request("GET", url, headers=headers, data={})


wine_data = {
    "name": "reds",
    "children": []
}


myjson = response.json()

for x in myjson:
    location = [x['location']]
    if (len(location[0].split('\n'))) == 1:
        country = "unknown-country"
        town = "unknown-city"
    else:
        location = (location[0].split('\n'))
        town_name = location[2]
        town = unidecode.unidecode(town_name)
        country = location[0]

    rating = [x['rating']]
    value = float(rating[0]['average'])

    winery = [x['winery']]
    wine = [x['wine']]

    # print(f"From {town}, {country}, {winery[0]} produced one of the great wines of the world: {wine[0]}.")
    # data = {'country': country, 'town': town, 'winery': winery[0], 'wine': wine[0], 'value': value}    
    # if country in wine_data['name']:
    #     continue
    # else:
    #     wine_data['name'] = country
    winery_name = unidecode.unidecode(winery[0])
    wine_name = unidecode.unidecode(wine[0])
    wine_score = {"name": wine_name, "value": value}
    country_node = next((child for child in wine_data["children"] if child["name"] == country), None)
    if country_node:
        # country_node["children"].append(data)
        town_node = next((child for child in country_node["children"] if child["name"] == town), None)
        if town_node:
            # town_node["children"].append(winery)
            winery_node = next((child for child in town_node["children"] if child["name"] == winery_name), None)
            if winery_node:
                winery_node["children"].append(wine_score)
            else:
                town_node["children"].append({
                "name": winery_name,
                "children": [wine_score]
            })
        else:
            country_node["children"].append({
                "name": town,
                "children": [{
                    "name": winery_name,
                    "children": [wine_score]
                }]
            })

    else:
        wine_data["children"].append({
            "name": country,
            "children": [{
                "name": town,
                "children": [{
                    "name": winery_name,
                    "children": [wine_score]
                }]
            }]
        })






    # country_node = next((child for child in wine_data['children'] if child['name'] == country), None)
    # if country_node:
    #     country_node['children'].append(data)
    # else:
    #     wine_data['children'].append({
    #         'name': country,
    #         'children': [data]
    #     })


with open('red_wine.json', 'w', encoding='UTF8') as f:
    json.dump(wine_data, f)

# print(wine_data)
print("done")