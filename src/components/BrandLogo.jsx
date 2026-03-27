const BrandLogo = ({ className = "h-16" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img
      src="/logo_01informatica_retina.png"
      alt="01Informatica"
      className="h-full object-contain drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
    />
  </div>
);

export default BrandLogo;
