import Layout from "@/components/UI/Layout"; // Import the Layout component
import "@/styles/globals.css"; // Global styles (optional)

function MyApp({ Component, pageProps }) {
  // Check if the page has `getLayout` defined
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return getLayout(<Component {...pageProps} />);
}

export default MyApp;