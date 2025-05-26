import React from 'react';
import { Routes, Route } from 'react-router-dom';

const OrganizationsList = () => (
  <div className="container max-w-screen-xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Organizations</h1>
    <div className="border rounded-lg p-6">
      <p className="text-center text-muted-foreground">
        Organizations list will go here
      </p>
    </div>
  </div>
);

const NewOrganization = () => (
  <div className="container max-w-screen-xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Create New Organization</h1>
    <div className="border rounded-lg p-6">
      <p className="text-center text-muted-foreground">
        New organization form will go here
      </p>
    </div>
  </div>
);

const Organizations = () => {
  return (
    <Routes>
      <Route index element={<OrganizationsList />} />
      <Route path="new" element={<NewOrganization />} />
    </Routes>
  );
};

export default Organizations;
