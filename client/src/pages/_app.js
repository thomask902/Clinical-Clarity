import Layout from "@/components/UI/Layout"; // Import the Layout component
import "@/styles/globals.css"; // Global styles (optional)

function MyApp({ Component, pageProps }) {
  return (
    <Layout> {/* Wrap every page inside Layout */}
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
