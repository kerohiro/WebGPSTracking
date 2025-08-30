import pandas as pd
import folium

# CSVファイルを読み込む
csv_file = "./log/sensor_log.csv"
df = pd.read_csv(csv_file)

# 緯度・経度がある行だけ抽出
df = df.dropna(subset=["lat", "lon"])

# 中心座標をデータの平均に設定
center_lat = df["lat"].mean()
center_lon = df["lon"].mean()

# Folium マップ作成
m = folium.Map(location=[center_lat, center_lon], zoom_start=15)

# CSV の各座標をマーカーでプロット
for idx, row in df.iterrows():
    popup_text = (
        f"Time: {row['time']}<br>"
        f"Accuracy: {row['accuracy']} m<br>"
        f"ax: {row.get('ax','')}, ay: {row.get('ay','')}, az: {row.get('az','')}<br>"
        f"alpha: {row.get('alpha','')}, beta: {row.get('beta','')}, gamma: {row.get('gamma','')}"
    )
    folium.CircleMarker(
        location=[row["lat"], row["lon"]],
        radius=5,
        color="blue",
        fill=True,
        fill_opacity=0.7,
        popup=folium.Popup(popup_text, max_width=300)
    ).add_to(m)

# 線で移動経路を描く
folium.PolyLine(df[["lat","lon"]].values.tolist(), color="red", weight=2.5, opacity=0.7).add_to(m)

# 地図を HTML ファイルとして保存
m.save("sensor_map.html")
print("地図を sensor_map.html に保存しました")