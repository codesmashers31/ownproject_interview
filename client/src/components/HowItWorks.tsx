const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Sign up as Student, Company, or Mentor",
      description: "Choose your role and create your profile to get started on your interview journey."
    },
    {
      number: "02", 
      title: "Schedule your mock interview",
      description: "Select from available time slots and choose your preferred mentor or interview focus area."
    },
    {
      number: "03",
      title: "Attend live session (HR + Technical)",
      description: "Join a comprehensive interview session covering both behavioral and technical aspects."
    },
    {
      number: "04",
      title: "Get feedback and scorecard instantly",
      description: "Receive detailed feedback and personalized recommendations to improve your performance."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps to transform your interview skills and boost your confidence.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center mb-12 group">
              <div className="flex-shrink-0 w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-6 md:mb-0 md:mr-8 group-hover:bg-accent smooth-transition">
                {step.number}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block w-full h-px bg-border my-8"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;