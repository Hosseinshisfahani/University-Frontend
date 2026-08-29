import Content from "../../layout/Content";
import QA from "./QA";
import { faqQuestions } from "@/app/_data/faq";

export default function FAQ() {
  return (
    <Content>
      <h2 className="text-3xl font-bold lg:text-5xl py-4 lg:py-6 text-center gradient-text title">
        «سوالات متداول»
      </h2>
      <ul className="py-4 w-full mb-10">
        {faqQuestions.map((question, idx) => (
          <QA key={idx} question={question} />
        ))}
      </ul>
    </Content>
  );
}
