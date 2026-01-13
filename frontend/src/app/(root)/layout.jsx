export const metadata = {
  title: "PromptBoard",
  description: "The ultimate prompt library",
};

export default function RootLayout({ children }) {
  // Ensure children is properly rendered
  if (!children) return null;
  
  // If children is an object with a children property, extract it
  if (typeof children === 'object' && 'children' in children && !children.type) {
    return <>{children.children}</>;
  }
  
  return <>{children}</>;
}
