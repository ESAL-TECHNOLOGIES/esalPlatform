import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ProgramsList = () => (
  <div className="container max-w-screen-xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Programs</h1>
    <div className="border rounded-lg p-6">
      <p className="text-center text-muted-foreground">
        Programs list will go here
      </p>
    </div>
  </div>
);

const NewProgram = () => (
  <div className="container max-w-screen-xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Create New Program</h1>
    <div className="border rounded-lg p-6">
      <p className="text-center text-muted-foreground">
        New program form will go here
      </p>
    </div>
  </div>
);

const Programs = () => {
  return (
    <Routes>
      <Route index element={<ProgramsList />} />
      <Route path="new" element={<NewProgram />} />
    </Routes>
  );
};

export default Programs;
