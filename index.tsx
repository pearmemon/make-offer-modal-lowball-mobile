import React, { useState, useMemo } from 'react';

interface MakeOfferModalProps {
  listPrice: number;
  minAcceptableOffPercent?: number;
  recommendedOffPercent?: number;
  lowballMode?: 'nudge' | 'block';
  onClose?: () => void;
  onSubmit?: (data: { selectedOption: string; price: number; message: string }) => void;
}

const svgClose = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#222222"/>
</svg>`;

const svgChevronDown = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.1998 10.3429L11.9998 16.2397L4.7998 10.3429L6.00801 8.85693L11.9998 13.7589L17.9916 8.85693L19.1998 10.3429Z" fill="#222222"/>
</svg>`;

const svgRadioSelected = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0.5C15.2467 0.5 19.5 4.75329 19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.5 15.2467 0.5 10C0.5 4.75329 4.75329 0.5 10 0.5Z" fill="white" stroke="#222222"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16Z" fill="#222222"/>
</svg>`;

const svgRadioUnselected = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0.5C15.2467 0.5 19.5 4.75329 19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.5 15.2467 0.5 10C0.5 4.75329 4.75329 0.5 10 0.5Z" fill="white" stroke="#DDDDDD"/>
</svg>`;

const svgBolt = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8571 1L2 11.4286H8.14286L9.14286 19L18 8.57143H11.8571L10.8571 1Z" fill="#222222"/>
</svg>`;

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  listPrice,
  minAcceptableOffPercent = 60,
  recommendedOffPercent = 5,
  lowballMode = 'block',
  onClose,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState('recommended');
  const [customPrice, setCustomPrice] = useState('');
  const [message, setMessage] = useState('');
  const [showLowballWarning, setShowLowballWarning] = useState(false);

  const recommendedPrice = Math.round(listPrice * (1 - recommendedOffPercent / 100));

  const discountPercent = useMemo(() => {
    if (!customPrice || selectedOption !== 'custom') return null;
    const price = parseFloat(customPrice);
    if (isNaN(price)) return null;
    return Math.round(((listPrice - price) / listPrice) * 100);
  }, [customPrice, selectedOption, listPrice]);

  const isLowballOffer = useMemo(() => {
    if (selectedOption !== 'custom' || !customPrice) return false;
    const price = parseFloat(customPrice);
    return !isNaN(price) && price <= listPrice * 0.4;
  }, [selectedOption, customPrice, listPrice]);

  const priceError = useMemo(() => {
    if (selectedOption === 'recommended') return null;
    if (!customPrice) return null;
    const price = parseFloat(customPrice);
    if (isNaN(price)) return 'Please enter a valid price';
    const minPrice = listPrice * 0.5;
    if (price < minPrice) return `Minimum offer is $${Math.round(minPrice).toLocaleString()}`;
    return null;
  }, [selectedOption, customPrice, listPrice]);

  const isCTADisabled = useMemo(() => {
    if (selectedOption === 'recommended') return false;
    if (!customPrice) return true;
    if (priceError) return true;
    if (lowballMode === 'block' && isLowballOffer) return true;
    return false;
  }, [selectedOption, customPrice, priceError, isLowballOffer, lowballMode]);

  const handleSubmit = () => {
    if (isLowballOffer && lowballMode === 'nudge' && !showLowballWarning) {
      setShowLowballWarning(true);
      return;
    }
    onSubmit?.({
      selectedOption,
      price: selectedOption === 'recommended' ? recommendedPrice : parseFloat(customPrice),
      message,
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeButton}>
            <div dangerouslySetInnerHTML={{ __html: svgClose }} />
          </button>
          <h1 style={styles.title}>Make an Offer</h1>
          <p style={styles.listPrice}>${listPrice.toLocaleString()}</p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.priceOptions}>
            {/* Recommended Price Option */}
            <div style={styles.recommendedOptionGroup}>
              <div style={styles.recommendedHeader}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="priceOption"
                    value="recommended"
                    checked={selectedOption === 'recommended'}
                    onChange={() => setSelectedOption('recommended')}
                    style={styles.radioInput}
                  />
                  <div
                    style={styles.radioIcon}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedOption === 'recommended'
                          ? svgRadioSelected
                          : svgRadioUnselected,
                    }}
                  />
                </label>
                <div style={styles.priceHeaderContent}>
                  <span style={styles.priceText}>
                    ${recommendedPrice.toLocaleString()}
                  </span>
                  <span style={styles.badge}>Recommended</span>
                  <span style={styles.discountText}>
                    {recommendedOffPercent}% off
                  </span>
                </div>
              </div>
              <p style={styles.optionSubtext}>
                Seller is likely to accept {recommendedOffPercent}-20% off the
                List Price
              </p>
            </div>

            {/* Custom Price Option */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <div style={styles.customOptionContainer}>
                <label style={styles.customRadioLabel}>
                  <input
                    type="radio"
                    name="priceOption"
                    value="custom"
                    checked={selectedOption === 'custom'}
                    onChange={() => setSelectedOption('custom')}
                    style={styles.radioInput}
                  />
                  <div
                    style={styles.radioIcon}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedOption === 'custom'
                          ? svgRadioSelected
                          : svgRadioUnselected,
                    }}
                  />
                </label>
                <span style={styles.customOptionLabel}>Name Your Price</span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                  }}
                >
                  <div style={styles.customInputContainer}>
                    <div
                      style={{
                        ...styles.customInputWrapper,
                        ...(priceError && styles.inputWrapperError),
                      }}
                    >
                      <span style={styles.currencySymbolInInput}>$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={customPrice}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setCustomPrice(value);
                            setShowLowballWarning(false);
                          }
                        }}
                        style={styles.priceInputField}
                      />
                      <span style={styles.usdTextInInput}>USD</span>
                    </div>
                    {customPrice &&
                      discountPercent !== null &&
                      selectedOption === 'custom' && (
                        <span style={styles.calculatedDiscount}>
                          {discountPercent}% off
                        </span>
                      )}
                  </div>
                </div>
              </div>
              {priceError && (
                <p style={{ ...styles.errorText, marginTop: '9px' }}>
                  {priceError}
                </p>
              )}
              {showLowballWarning && lowballMode === 'nudge' && (
                <p style={{ ...styles.errorText, marginTop: '9px' }}>
                  Warning: An offer significantly below the list price will
                  likely be rejected. We recommend raising your offer.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonsSection}>
          <button
            onClick={handleSubmit}
            disabled={isCTADisabled}
            style={{
              ...styles.continueButton,
              ...(isCTADisabled ? styles.continueButtonDisabled : {}),
            }}
          >
            CONTINUE
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.boltIcon} dangerouslySetInnerHTML={{ __html: svgBolt }} />
          <p style={styles.urgencyText}>
            Don't miss out! The item is in 2 carts.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '100vw',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '20px 20px 12px',
    alignItems: 'center',
  },
  title: {
    fontFamily: "'Cardinal Classic Short', serif",
    fontSize: '20px',
    fontWeight: 400,
    letterSpacing: '-0.5px',
    lineHeight: 1.4,
    margin: 0,
    color: '#000',
  },
  listPrice: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.5,
    margin: 0,
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '12px 20px 20px',
    overflow: 'auto',
    flex: 1,
  },
  priceOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  recommendedOptionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  recommendedHeader: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
  },
  radioLabel: {
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
    marginRight: '20px',
    alignSelf: 'flex-start',
  },
  radioInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    cursor: 'pointer',
  },
  radioIcon: {
    width: '20px',
    height: '20px',
    display: 'block',
  },
  priceHeaderContent: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priceText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#000',
  },
  badge: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#ceecc1',
    color: '#0e3c1e',
    padding: '0.5px 8px',
    borderRadius: '72px',
    whiteSpace: 'nowrap',
    lineHeight: 1.5,
  },
  discountText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    color: '#000',
  },
  optionSubtext: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 300,
    lineHeight: 1.5,
    margin: 0,
    color: '#000',
    marginLeft: '38px',
  },
  customOptionContainer: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
    width: '100%',
  },
  customRadioLabel: {
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
    marginRight: '20px',
    alignSelf: 'center',
  },
  customOptionLabel: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#000',
    margin: 0,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    marginRight: '9px',
  },
  customInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    marginRight: '20px',
  },
  customInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    width: '140px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    paddingLeft: '9px',
    paddingRight: '9px',
    boxSizing: 'border-box',
  },
  inputWrapperError: {
    borderColor: '#c41c1c',
  },
  currencySymbolInInput: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    color: '#000',
    marginRight: '5px',
  },
  priceInputField: {
    flex: 1,
    minWidth: '0',
    textAlign: 'right',
    border: 'none',
    outline: 'none',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    color: '#000',
  },
  usdTextInInput: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 300,
    color: '#999',
    marginLeft: '5px',
  },
  calculatedDiscount: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 300,
    color: '#000',
    marginTop: '0',
  },
  errorText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 300,
    color: '#c41c1c',
    margin: 0,
    marginLeft: '38px',
  },
  buttonsSection: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e5e5',
  },
  continueButton: {
    width: '100%',
    padding: '12px 16px',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  continueButtonDisabled: {
    backgroundColor: '#e5e5e5',
    color: '#999',
    cursor: 'not-allowed',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#f9f9f9',
  },
  boltIcon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  urgencyText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 300,
    lineHeight: 1.5,
    margin: 0,
    color: '#000',
  },
};
