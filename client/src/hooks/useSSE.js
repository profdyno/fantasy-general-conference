import { useEffect } from 'react'

export default function useSSE(url, onMessage) {
  useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {
        onMessage(e.data);
      }
    };
    return () => es.close();
  }, [url]);
}
