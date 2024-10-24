import { useState, useRef, useEffect } from "react";

import styled from "styled-components";

// Define styled components for styling
const WebcamContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const WebcamVideo = styled.video`
  width: 100%;
  border-radius: 10px;
  /* Apply specific styles only for mobile devices */
  @media (max-width: 767px) {
    height: 100vh;
    object-fit: cover;
    border-radius: 0;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  border-radius: 10px;
  @media (max-width: 767px) {
    height: 100vh;
    object-fit: cover;
    border-radius: 0;
  }
`;

const WebcamCanvas = styled.canvas`
  display: none; /* Hide canvas by default */
`;


const WebcamTorchButton = styled.button`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WebcamButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashLightOn, setIsFlashLighOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);


  useEffect(() => {
    startWebcam();
  }, []);

  useEffect(() => {
    swtichTorch(isFlashLightOn);
  }, [isFlashLightOn]);

  const swtichTorch = async (on = false) => {
    if (mediaStream && navigator?.mediaDevices) {
      const supportedContraints = navigator?.mediaDevices?.getSupportedConstraints();
      const [track] = mediaStream?.getTracks();
      if (supportedContraints && "torch" in supportedContraints && track) {
        try {
          await track.applyConstraints({advanced: [{torch: on }]} as MediaTrackConstraintSet);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Request the front camera (selfie camera)
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaStream(stream);
      swtichTorch(false).then((success) => setTorchSupported(success));
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  // Function to stop the webcam
  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video stream
      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame onto canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data URL from canvas
        const imageDataUrl = canvas.toDataURL("image/jpeg");

        // Set the captured image
        setCapturedImage(imageDataUrl);

        // Stop the webcam
        stopWebcam();

        // You can do something with the captured image here, like save it to state or send it to a server
      }
    }
  };

  // Function to reset state (clear media stream and refs)
  const resetState = () => {
    stopWebcam(); // Stop the webcam if it's active
    setCapturedImage(null); // Reset captured image
  };

  const toggleTorch = (event: any) => {
    setIsFlashLighOn(flashLight => !flashLight);
  }

  return (
    <WebcamContainer>
      {capturedImage ? (
        <>
          <PreviewImg src={capturedImage} className="captured-image" />
          <WebcamButton onClick={resetState}>Reset</WebcamButton>
        </>
      ) : (
        <>
          <WebcamVideo ref={videoRef} autoPlay muted />
          <WebcamCanvas ref={canvasRef} />
          {!videoRef.current ? (
            <>
              <WebcamTorchButton
                onClick={toggleTorch}
                style={{ backgroundColor: "#333", color: "#fff" }}
              >
                {isFlashLightOn? "Torch Off" : "Torch On" }
              </WebcamTorchButton>
              <WebcamButton
                onClick={startWebcam}
                style={{ backgroundColor: "#333", color: "#fff" }}
              >
                Start Webcam
              </WebcamButton>
            </>
          ) : (
            <WebcamButton onClick={captureImage}>Capture Image</WebcamButton>
          )}
        </>
      )}
    </WebcamContainer>
  );
};

export default WebcamCapture;
