import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import { verifyToken } from '@/lib/utils/auth';
import { deleteFromCloudinary } from '@/lib/utils/cloudinary';

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && dependant.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let documentFound = false;
    let publicIdToDelete: string | null = null;

    // Check personalPassportPicture
    if (dependant.personalPassportPicture && 
        (dependant.personalPassportPicture._id?.toString() === params.docId || 
         dependant.personalPassportPicture.publicId === params.docId)) {
      publicIdToDelete = dependant.personalPassportPicture.publicId;
      dependant.personalPassportPicture = undefined;
      documentFound = true;
    }
    // Check internationalPassport
    else if (dependant.internationalPassport && 
             (dependant.internationalPassport._id?.toString() === params.docId || 
              dependant.internationalPassport.publicId === params.docId)) {
      publicIdToDelete = dependant.internationalPassport.publicId;
      dependant.internationalPassport = undefined;
      documentFound = true;
    }
    // Check supportingDocuments array
    else if (dependant.supportingDocuments && dependant.supportingDocuments.length > 0) {
      const docIndex = dependant.supportingDocuments.findIndex(
        (doc: any) => doc._id?.toString() === params.docId || doc.publicId === params.docId
      );
      
      if (docIndex !== -1) {
        publicIdToDelete = dependant.supportingDocuments[docIndex].publicId;
        dependant.supportingDocuments.splice(docIndex, 1);
        documentFound = true;
      }
    }
    // Also check general documents array (for backward compatibility)
    if (!documentFound && dependant.documents && dependant.documents.length > 0) {
      const document = dependant.documents.id(params.docId);
      if (document) {
        publicIdToDelete = document.publicId;
        dependant.documents.pull(params.docId);
        documentFound = true;
      }
    }

    if (!documentFound) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    if (publicIdToDelete) {
      await deleteFromCloudinary(publicIdToDelete);
    }

    await dependant.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
