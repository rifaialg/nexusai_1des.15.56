import React, { useState } from 'react';
import { ImageGenTabs, ImageMode } from './ImageGenTabs';
import { TextToImage } from './TextToImage';
import { PhotoMerger } from './PhotoMerger';
import { ProductComposite } from './ProductComposite';
import { BgRemover } from './BgRemover';
import { AnimatePresence, motion } from 'framer-motion';

export const ImageGenContainer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ImageMode>('text-to-image');

  const renderContent = () => {
    switch (activeMode) {
      case 'text-to-image': return <TextToImage />;
      case 'merger': return <PhotoMerger />;
      case 'product': return <ProductComposite />;
      case 'bg-remover': return <BgRemover />;
      default: return <TextToImage />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ImageGenTabs activeMode={activeMode} onModeChange={setActiveMode} />
      
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
