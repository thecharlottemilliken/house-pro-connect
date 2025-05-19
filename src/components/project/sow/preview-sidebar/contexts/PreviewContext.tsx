
import React, { createContext, useState } from 'react';

interface PreviewContextType {
  previewUrl: string | null;
  isPreviewLoading: boolean;
  handlePreview: (url: string) => void;
  closePreview: () => void;
}

export const PreviewContext = createContext<PreviewContextType>({
  previewUrl: null,
  isPreviewLoading: false,
  handlePreview: () => {},
  closePreview: () => {},
});

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handlePreview = (url: string) => {
    setIsPreviewLoading(true);
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <PreviewContext.Provider value={{ previewUrl, isPreviewLoading, handlePreview, closePreview }}>
      {children}
    </PreviewContext.Provider>
  );
};
