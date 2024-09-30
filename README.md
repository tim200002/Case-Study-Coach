# Consulting Case Study Preparation Coach
This project was developed as part of the Data Science lecture at Seoul National University. Successfully completing case studies is a crucial skill for interviews in many competitive fields, such as consulting. However, preparing for them can be challenging—either requiring a partner or expensive professional coaching. Our goal is to offer an alternative: a chatbot that acts as a preparation coach and gives feedback after the study was completed. 

## Demo
Unfortunately, I am currently missing the API keys to host the project on my own. A short video demo from the final project presentation is provided below. The slides of the final presentation, better motivating our approach and solution, are provided here ([pdf](./assets/Presentation.pdf), [pptx](./assets/Presentation.pptx)).

**Watch a Demo of our Case Stuy Coach in Action**

https://github.com/user-attachments/assets/aa881da5-1cc6-4f06-a120-dd669701e831


## Project Overview
Besides creating an easy to use full-stack application, the main challenge in this project was creating a chatbot capable of effectively guiding users through a case study. Simple prompting did not yield the desired results, so we developed a custom data format to store and organize case studies.

This format includes:

- **Sections:** Each case study is divided into sections.
- **Per-section information and deliverables:** Each section contains specific information and expected outputs.
- **Sequential and parallel structures:** Sections can either follow a sequential order or be completed in parallel, where order does not matter.

This structured approach enables the chatbot to prompt the user more effectively—only advancing when required deliverables are met. This structured section also enabled us to provide effective evaluations on a per section basis.

## My Role
As the tech lead on this project, I was responsible for developing the custom data format and implementing the chatbot logic. I also led the design and construction of the majority of the user interface. Furthermore, I supported my teammates, who were less experienced in web application development, ensuring they contributed effectively to the project, ultimately leading to us all receiving an A at the end of the semester.
