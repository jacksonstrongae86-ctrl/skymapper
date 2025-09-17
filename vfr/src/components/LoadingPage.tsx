import Image from "next/image";
import logoUrl from "../../public/logo.png";

export default function LoadingPage() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="animate-pulse">
        <Image 
          src={logoUrl} 
          alt="skymapper.es" 
          width={120} 
          height={120} 
          priority 
          className="rounded-lg drop-shadow-lg" 
        />
      </div>
    </div>
  );
}