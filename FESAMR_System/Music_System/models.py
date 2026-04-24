from django.db import models


class EmotionDetection(models.Model):
    emotion = models.CharField(max_length=50)
    confidence = models.FloatField()
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emotion} ({self.confidence}%)"


class MusicRecommendation(models.Model):
    emotion_detection = models.ForeignKey(
        EmotionDetection,
        on_delete=models.CASCADE,
        related_name="recommendations"
    )
    song_name = models.CharField(max_length=200)
    artist = models.CharField(max_length=200, blank=True, null=True)
    recommended_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.song_name} - {self.artist}"