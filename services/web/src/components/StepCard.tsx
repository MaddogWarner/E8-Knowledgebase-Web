import type { ImplementationStep } from '../types';
import { CodeBlock } from './CodeBlock';

interface StepCardProps {
  step: ImplementationStep;
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  return (
    <article className="step-card" id={step.id}>
      <div className="step-number">{index + 1}</div>
      <div className="step-content">
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="technical-details">
          {step.technicalDetails.map((detail) => (
            <CodeBlock key={detail} text={detail} />
          ))}
        </div>
      </div>
    </article>
  );
}

