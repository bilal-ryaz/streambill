import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="/preview" element={<InvoicePreview />} />
      </Routes>
    </HashRouter>
  );
};

export default App;