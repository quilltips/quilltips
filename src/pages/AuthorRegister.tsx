
import { AuthorRegistrationForm } from "@/components/AuthorRegistrationForm";
import { Helmet } from "react-helmet-async";

const AuthorRegister = () => {
  return (
    <>
      <Helmet>
        <script>
          {`!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_h5wzcimw9952');rdt('track', 'PageVisit');`}
        </script>
      </Helmet>
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-xl">
        <AuthorRegistrationForm />
      </main>
    </>
  );
};

export default AuthorRegister;
