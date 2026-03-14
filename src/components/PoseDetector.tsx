import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

interface PoseDetectorProps {
  onPoseUpdate: (results: PoseLandmarkerResult) => void;
}

const PoseDetector: React.FC<PoseDetectorProps> = ({ onPoseUpdate }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  useEffect(() => {
    const initPose = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 2 // Support up to 2 people
      });
      
      poseLandmarkerRef.current = poseLandmarker;
    };

    initPose();

    return () => {
      poseLandmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const detect = async () => {
      if (
        webcamRef.current?.video &&
        webcamRef.current.video.readyState === 4 &&
        poseLandmarkerRef.current
      ) {
        const video = webcamRef.current.video;
        const startTimeMs = performance.now();
        
        const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);
        onPoseUpdate(results);

        if (canvasRef.current) {
          const canvasCtx = canvasRef.current.getContext('2d');
          if (canvasCtx) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            if (results.landmarks) {
              results.landmarks.forEach((landmarks) => {
                // Draw skeleton
                canvasCtx.strokeStyle = "#00FF00";
                canvasCtx.lineWidth = 4;
                
                // Simple skeleton drawing
                const connections = [
                  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
                  [11, 23], [12, 24], [23, 24],
                  [23, 25], [25, 27], [24, 26], [26, 28]
                ];

                connections.forEach(([i, j]) => {
                  const p1 = landmarks[i];
                  const p2 = landmarks[j];
                  if (p1 && p2) {
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(p1.x * canvasRef.current!.width, p1.y * canvasRef.current!.height);
                    canvasCtx.lineTo(p2.x * canvasRef.current!.width, p2.y * canvasRef.current!.height);
                    canvasCtx.stroke();
                  }
                });

                landmarks.forEach(landmark => {
                  canvasCtx.fillStyle = "#00FF00";
                  canvasCtx.beginPath();
                  canvasCtx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 4, 0, 2 * Math.PI);
                  canvasCtx.fill();
                });
              });
            }
            canvasCtx.restore();
          }
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    detect();
    return () => cancelAnimationFrame(animationFrameId);
  }, [onPoseUpdate]);

  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        mirrored={true}
        audio={false}
        screenshotFormat="image/jpeg"
        disablePictureInPicture={true}
        forceScreenshotSourceSize={false}
        imageSmoothing={true}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotQuality={1}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: 'user',
        }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default PoseDetector;
