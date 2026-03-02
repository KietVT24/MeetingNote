/**
 * Component Section tái sử dụng
 * Giúp chuẩn hóa padding (py) và max-width (maxWidth) cho các section.
 */
export default function Section({
  id,
  children,
  className = '',
  maxWidth = '7xl', // '7xl', '6xl', '5xl', '4xl', '3xl'
}) {
  const maxWidthClass =
    {
      '7xl': 'max-w-7xl',
      '6xl': 'max-w-6xl',
      '5xl': 'max-w-5xl',
      '4xl': 'max-w-4xl',
      '3xl': 'max-w-3xl',
    }[maxWidth] || 'max-w-7xl';

  return (
    <section
      id={id}
      // Thêm padding chuẩn cho tất cả các section
      className={`py-16 sm:py-20 ${className}`}
    >
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </section>
  );
}
