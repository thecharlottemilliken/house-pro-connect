
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [password, setPassword] = useState("");
  const { deleteAccount, isDeleting } = useAccountDeletion();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const { success } = await deleteAccount(password);
    if (success) {
      onOpenChange(false);
      navigate("/");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently delete your account
            and remove all of your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-destructive">
              Confirm your password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to confirm"
              className="border-destructive focus:ring-destructive"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            <h4 className="font-semibold mb-2">The following will be deleted:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your user account and profile</li>
              <li>All projects you have created</li>
              <li>All properties you have added</li>
              <li>All messages you have sent or received</li>
              <li>All team memberships</li>
            </ul>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
            disabled={isDeleting || !password.trim()}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Deleting</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
