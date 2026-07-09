import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F1EDEA] flex items-center justify-center py-12 px-4 select-none">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-[#212121] text-[#C84B31] border-2 border-[#212121] shadow-[4px_4px_0px_#C84B31]">
          <AlertTriangle size={48} />
        </div>
        <div className="space-y-2">
          <Badge variant="terracotta">[ ERROR 404 — VOID ROUTE ]</Badge>
          <h1 className="font-mono text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#212121]">
            SPACE NOT FOUND
          </h1>
          <p className="font-sans text-sm text-[#212121]/70 leading-relaxed">
            The architectural coordinates requested (`window.location.pathname`) do not map to an existing suite or registry endpoint in the StayWise cluster.
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="primary" size="lg" className="w-full">
              RETURN TO ARCHITECTURAL REGISTRY
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
