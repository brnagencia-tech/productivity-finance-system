// Simple toast hook using browser alert for now
// Can be replaced with a proper toast library later

export function useToast() {
  return {
    toast: ({ title, description, variant }: { 
      title: string; 
      description?: string; 
      variant?: "default" | "destructive" 
    }) => {
      const message = description ? `${title}\n${description}` : title;
      if (variant === "destructive") {
        alert(`❌ ${message}`);
      } else {
        alert(`✅ ${message}`);
      }
    }
  };
}
