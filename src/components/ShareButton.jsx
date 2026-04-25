import React, { useState } from 'react';

function ShareButton({ url, title, text }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;
    const shareTitle = title || 'DairyFresh Products';
    const shareText = text || 'Check out this awesome product from DairyFresh!';

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
                setIsOpen(!isOpen);
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                onClick={handleNativeShare}
                className="btn"
                style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #2ecc71',
                    color: '#2ecc71',
                    padding: '8px 15px',
                    marginLeft: '10px'
                }}
            >
                🔗 Share
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    zIndex: 1000
                }}>
                    <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={iconStyle}>
                        📱
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="Facebook" style={iconStyle}>
                        📘
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodedText}`} target="_blank" rel="noopener noreferrer" title="Twitter" style={iconStyle}>
                        🐦
                    </a>
                    <button onClick={copyToClipboard} title="Copy Link" style={{...iconStyle, border: 'none', cursor: 'pointer'}}>
                        {copied ? '✅' : '📋'}
                    </button>
                </div>
            )}
        </div>
    );
}

const iconStyle = {
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: '50%',
    textDecoration: 'none',
    color: '#228b22',
    transition: 'all 0.3s ease'
};

export default ShareButton;
