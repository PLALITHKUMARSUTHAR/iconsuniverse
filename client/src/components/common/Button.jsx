import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-wide rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';

  const variants = {
    primary:
      'bg-energy-gradient text-white shadow-coral hover:shadow-lg hover:scale-105 border border-white/20',
    secondary:
      'bg-landing-primary text-white hover:bg-landing-primary-container shadow-md hover:scale-105',
    subpagePrimary:
      'bg-primary-gradient text-white shadow-md hover:shadow-xl hover:scale-105',
    glass:
      'glass-landing text-landing-on-surface hover:bg-white border border-white/60 shadow-glass hover:shadow-glass-hover',
    outline:
      'border-2 border-landing-primary text-landing-primary hover:bg-landing-primary hover:text-white',
    ghost:
      'text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low',
    danger:
      'bg-landing-error text-white hover:bg-red-700 shadow-md',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
    xl: 'px-10 py-4 text-lg gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
