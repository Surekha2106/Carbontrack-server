import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import tropicalBg from '../assets/tropical_leaves_bg.png';

interface ECertificateProps {
  userName: string;
  targetAchieved: string;
}

export const ECertificate: React.FC<ECertificateProps> = ({ userName, targetAchieved }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        setIsDownloading(true);
        const dataUrl = await toPng(certificateRef.current, {
          quality: 1,
          pixelRatio: 2, // 2x resolution
          style: { backgroundColor: '#304d30' } // Fallback outer color
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${userName.replace(/\s+/g, '_')}_CarbonTrack_Certificate.png`;
        link.click();
      } catch (error) {
        console.error('Error generating certificate image:', error);
        alert('Failed to download the certificate. Please try again or try a different browser.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col items-center gap-6 mt-12 w-full max-w-4xl mx-auto">
      {/* The Printable Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-full aspect-[1.414/1] md:aspect-[1.3/1] shadow-2xl bg-[#304d30] overflow-hidden"
      >
        {/* Background Image (Leaf Border) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: `url(${tropicalBg})` }}
        />

        {/* Inner Beige Certificate Area */}
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[#F4EFE6] shadow-xl flex flex-col items-center justify-between py-10 md:py-16 px-8 md:px-20 text-[#1A3B2B] text-center z-10">
          
          <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide text-[#1A3B2B]">
              CERTIFICATE
            </h1>
            <p className="text-sm md:text-base font-sans tracking-[0.3em] font-medium mt-2 text-[#1A3B2B]">
              OF APPRECIATION
            </p>
          </div>

          <div className="w-full flex flex-col items-center my-4 md:my-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A3B2B]">
              {userName}
            </h2>
            <div className="w-full max-w-2xl h-px bg-[#1A3B2B] mt-2" />
          </div>

          <div className="flex flex-col items-center max-w-2xl">
            <h3 className="text-base md:text-xl font-serif font-bold text-[#1A3B2B] mb-2">
              Your remarkable efforts and dedication to sustainability
            </h3>
            <p className="text-xs md:text-sm font-sans text-[#1A3B2B]/80 leading-relaxed max-w-xl">
              Your unwavering dedication and exceptional commitment to reducing carbon emissions. 
              Through your mindful choices, hard work, and passion for nature, you have successfully 
              achieved {targetAchieved}, transforming our world into a greener environment.
            </p>
          </div>

          {/* Footer: Date and Signature */}
          <div className="flex justify-between w-full max-w-2xl mt-auto pt-4 px-2 md:px-8">
            
            {/* Date Section */}
            <div className="flex flex-col items-center w-28 md:w-40 mt-auto">
              <div className="font-sans font-medium text-sm md:text-base text-[#1A3B2B] mb-2">{today}</div>
              <div className="w-full h-px bg-[#1A3B2B] mb-1" />
              <p className="text-xs font-sans font-semibold text-[#1A3B2B]">Date</p>
            </div>

            {/* Signature Section */}
            <div className="flex flex-col items-center w-40 md:w-48 mt-auto">
              <div className="font-serif font-bold italic text-xl md:text-2xl text-[#1A3B2B] mb-2 whitespace-nowrap">
                Team CarbonTrack
              </div>
              <div className="w-full h-px bg-[#1A3B2B] mb-1" />
              <p className="text-xs font-sans font-semibold text-[#1A3B2B]">Team CarbonTrack</p>
            </div>

          </div>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        disabled={isDownloading}
        className={`btn-primary flex items-center gap-2 py-3 px-8 text-lg shadow-lg hover:-translate-y-1 transition-transform ${isDownloading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        <Download size={20} className={isDownloading ? 'animate-bounce' : ''} /> 
        {isDownloading ? 'Generating Certificate...' : 'Download E-Certificate'}
      </button>
    </div>
  );
};
