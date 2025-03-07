import React from 'react';

interface OptionsPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

const OptionsPopup: React.FC<OptionsPopupProps> = ({ isVisible, onClose }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Options</h2>
                <button className="border border-red-300 text-red-300 bg-white w-full rounded-lg p-2 mb-2">Finish story</button>
                <button className="border border-gray-300 bg-white w-full rounded-lg p-2 mb-2">Edit title and image</button>
                <button onClick={onClose} className="border bg-gray-500 text-white border-gray-300 w-full rounded-lg p-2">Cancel</button>
            </div>
        </div>
    );
};

export default OptionsPopup;