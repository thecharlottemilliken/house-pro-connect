
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProjectReviewForm } from "./ProjectReviewForm";

type SOWData = {
  id: string;
  work_areas: any[];
  labor_items: any[];
  material_items: any[];
  bid_configuration: {
    bidDuration: string;
    projectDescription: string;
  };
  project_id: string;
  status: string;
};
const SOWReviewPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [sowData, setSowData] = useState<SOWData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Only owners can access this page
  useEffect(() => {
    if (!profile || profile.role !== "resident") {
      toast({ title: "Access Denied", description: "You do not have access to this page.", variant: "destructive" });
      navigate(`/project-dashboard/${projectId}`);
    }
    // eslint-disable-next-line
  }, [profile]);
  
  // Fetch SOW data
  useEffect(() => {
    const fetchSOW = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("statement_of_work")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      if (error || !data) {
        setSowData(null);
        setLoading(false);
        return;
      }
      setSowData({
        ...data,
        work_areas: typeof data.work_areas === "string" ? JSON.parse(data.work_areas) : data.work_areas || [],
        labor_items: typeof data.labor_items === "string" ? JSON.parse(data.labor_items) : data.labor_items || [],
        material_items: typeof data.material_items === "string" ? JSON.parse(data.material_items) : data.material_items || [],
        bid_configuration: typeof data.bid_configuration === "string" ? JSON.parse(data.bid_configuration) : data.bid_configuration || { bidDuration: "", projectDescription: "" },
      });
      setLoading(false);
    };
    if (projectId) fetchSOW();
  }, [projectId]);

  const handleApprove = async () => {
    if (!sowData) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("statement_of_work")
      .update({ status: "approved", feedback: null })
      .eq("id", sowData.id);
    setActionLoading(false);
    if (error) {
      toast({ title: "Error", description: "Failed to approve SOW.", variant: "destructive" });
    } else {
      toast({ title: "SOW Approved", description: "Statement of Work successfully approved." });
      navigate(`/project-dashboard/${projectId}`);
    }
  };

  const handleReject = async () => {
    if (!sowData) return;
    if (!feedback) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for the coach.",
        variant: "destructive",
      });
      return;
    }
    setActionLoading(true);
    const { error } = await supabase
      .from("statement_of_work")
      .update({ status: "pending revision", feedback })
      .eq("id", sowData.id);
    setActionLoading(false);
    if (error) {
      toast({ title: "Error", description: "Failed to request SOW revisions.", variant: "destructive" });
    } else {
      toast({ title: "Revision Requested", description: "Coach will be notified to address feedback." });
      setFeedback("");
      navigate(`/project-dashboard/${projectId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Statement of Work...</p>
        </div>
      </div>
    );
  }

  if (!sowData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <h2 className="text-lg font-semibold mb-6">No Statement of Work found for this project.</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="h-14 border-b flex items-center px-0 bg-white">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/project-dashboard/${projectId}`)}>
          <ChevronLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-md font-medium">Statement of Work Review</h1>
        </div>
        <div className="w-[72px]" />
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Approve SOW</h2>
        
        <ProjectReviewForm
          workAreas={sowData.work_areas || []}
          laborItems={sowData.labor_items || []}
          materialItems={sowData.material_items || []}
          bidConfiguration={sowData.bid_configuration || { bidDuration: '', projectDescription: '' }}
          projectId={projectId || ""}
          onSave={() => {}}
        />

        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Request Changes</h3>
          <Textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="If requesting changes, provide your feedback to the coach here."
            rows={4}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handleReject} disabled={actionLoading}>
              Request Changes
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              Approve SOW
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SOWReviewPage;
