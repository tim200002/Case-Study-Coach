import Header from "../_components/header";

export const Metadata = {
  title: "About",
};

export default function About() {
  // This array could be fetched from an API or defined elsewhere
  const faqs = [
    {
      question: "What is this app for?",
      answer:
        "This app is designed to help users practice and solve case studies.",
    },
    {
      question: "Who can use this app?",
      answer:
        "Anyone preparing for case interviews or interested in business case studies can use this app.",
    },
    // ... more questions and answers
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4">
        <h1 className="my-6 text-center text-3xl font-bold">About Us</h1>
        <p className="text-lg text-gray-700">
          Welcome to our app, a platform dedicated to providing quality case
          study materials for learners and professionals alike. Here you can
          practice solving case studies to prepare for interviews or to sharpen
          your analytical skills.
        </p>

        {/* Q&A Section */}
        <div className="my-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
