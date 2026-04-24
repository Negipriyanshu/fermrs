import json
import base64
import numpy as np
import cv2
import os

from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from tensorflow.keras.models import load_model


# Load model
model_path = os.path.join(
    settings.BASE_DIR,
    'ml_models',
    'face_emotion_model',
    'face_emotion_recognition.keras'
)

model = load_model(model_path)

emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']


# 🔹 Detection Page View
def detection_page(request):
    return render(request, 'detection.html')


# 🔹 Emotion API
@csrf_exempt
def detect_emotion(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            image_data = data.get("image")

            if not image_data:
                return JsonResponse({"error": "No image provided"})

            image_data = image_data.split(",")[1]
            img_bytes = base64.b64decode(image_data)

            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

            if img is None:
                return JsonResponse({"error": "Invalid image"})

            img = cv2.resize(img, (48, 48))
            img = img / 255.0
            img = np.reshape(img, (1, 48, 48, 1))

            prediction = model.predict(img)
            emotion = emotion_labels[np.argmax(prediction)]
            confidence = float(np.max(prediction))

            return JsonResponse({
                "emotion": emotion,
                "confidence": confidence
            })

        except Exception as e:
            return JsonResponse({"error": str(e)})

    return JsonResponse({"error": "Invalid request"})


import pandas as pd

# Load recommendation model
rec_model_path = os.path.join(
    settings.BASE_DIR,
    'ml_models',
    'music_recommendation',
    'music_emotion_model.pkl'
)

import joblib
music_model = joblib.load(rec_model_path)

# Load dataset (update filename if different)
data_path = os.path.join(settings.BASE_DIR, 'dataset', 'music', 'SpotifyAudioFeaturesWithEmotions.csv')
songs_df = pd.read_csv(data_path)


@csrf_exempt
def recommend_songs(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            emotion = data.get("emotion")

            if not emotion:
                return JsonResponse({"error": "No emotion provided"})

            # 🔥 Example filtering (adjust based on your model)
            filtered = songs_df[songs_df['emotion'] == emotion]

            if filtered.empty:
                return JsonResponse({"songs": []})

            top_songs = filtered.sample(5)

            result = top_songs[['track_name', 'artist_name']].to_dict(orient='records')

            return JsonResponse({"songs": result})

        except Exception as e:
            return JsonResponse({"error": str(e)})

    return JsonResponse({"error": "Invalid request"})