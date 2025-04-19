const ASSEMBLY_AI_API_KEY = "bb1ff651bd39436db7a2c74b46be8a88";

export async function submitTranscriptionJob(fileUrl: string): Promise<string> {
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: ASSEMBLY_AI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({ audio_url: fileUrl }),
  });

  if (!response.ok) {
    throw new Error(`AssemblyAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
}

export async function getTranscriptionStatus(id: string): Promise<{
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  error?: string;
}> {
  const response = await fetch(
    `https://api.assemblyai.com/v2/transcript/${id}`,
    {
      headers: { authorization: ASSEMBLY_AI_API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`AssemblyAI API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === "completed") {
    return { status: "completed", text: data.text };
  } else if (data.status === "error") {
    return { status: "error", error: data.error || "Unknown error occurred" };
  } else if (data.status === "processing") {
    return { status: "processing" };
  } else {
    return { status: "queued" };
  }
}

export async function pollTranscriptionUntilComplete(
  id: string,
  onProgress?: (status: string) => void,
  maxAttempts = 60, // Default maximum polling attempts (5 minutes at 5-second intervals)
  intervalMs = 5000 // Default 5-second interval
): Promise<string> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        reject(new Error("Transcription timed out"));
        return;
      }

      attempts++;

      try {
        const statusResult = await getTranscriptionStatus(id);

        if (onProgress) {
          onProgress(statusResult.status);
        }

        if (statusResult.status === "completed") {
          resolve(statusResult.text!);
        } else if (statusResult.status === "error") {
          reject(new Error(statusResult.error || "Transcription failed"));
        } else {
          // Still processing, wait and try again
          setTimeout(checkStatus, intervalMs);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
}
