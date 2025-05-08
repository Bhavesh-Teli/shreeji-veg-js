import React from "react";


type InvoiceItem = {
  description: string;
  qty: number;
  rate: number;
  amount: number;
};

const OrderPDF: React.FC = () => {
  const items: InvoiceItem[] = [
    { description: "BATAKA BIG KANDA BIG", qty: 5, rate: 100, amount: 500 },
    { description: "DAL RICE", qty: 3, rate: 150, amount: 450 },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: '10px',
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}

    >
      <div>
        <p style={{ fontSize: "14pt", fontWeight: "bold" }}>
          INVOICE <span style={{ float: "right" }}>Credit Memo</span>
        </p>

        <div style={{ border: "1px solid black", padding: "10px", display: "flex", alignItems: "center" }}>
          <div style={{ marginLeft: "10px", marginRight: "10px" }}>
            <img src="/01.png" alt="Logo" style={{ width: "200px", height: "130px", objectFit: "contain" }} />
          </div>

          <div style={{ textAlign: "center", width: "100%", }}>
            <h1 style={{ fontSize: "30px", marginLeft: "10px", marginBottom: "0" }}>
              <strong>SHREEJI VEG. & FRUIT</strong>
            </h1>
            <p style={{ fontSize: "11pt", margin: "0", lineHeight: "1.6", wordSpacing: "2px" }}>
              D-31, Vishal Nagar Society, B/s. Sardar Bridge, Adajan Road, SURAT<br />
              Phone (O): 9924613277 , Mobile No.: 7211177000
            </p>
          </div>
        </div>
        {/* Customer & Invoice Section */}
        <div style={{ display: "flex", width: "100%", justifyContent: "end" }}>
          <div style={{ border: "1px solid black", padding: "10px", width: "60%" }}>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <div style={{ justifyContent: "space-between", marginBottom: "5px" }}>
                <h1 style={{ fontSize: '18px', margin: 0 }}>
                  <strong>Nanalal sweet & caterers</strong>
                </h1>
                <p>
                  <strong>GST No.:</strong> 24ADUPB6867D1ZD
                </p>
                <p style={{ margin: 0 }}>Mob. No.: 9825430600</p>
                <p style={{ margin: 0 }}>Ph. No.: 0261 2894442</p>
              </div>
              <div>
              </div>
            </div>

          </div>

          {/* Invoice Details + Delivery Address */}
          <div style={{ border: "1px solid black", padding: "10px", width: "40%" }}>
            <div style={{ display: "flex", gap: '100px', marginBottom: "10px", textAlign: "left" }}>
              <p><strong>Invoice No.:</strong> 00016</p>
              <p><strong>Dated:</strong> 01/04/2025</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <p><strong>Delivery Address:</strong></p>
              {/* Add address here if needed */}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Invoice Table */}
      <div style={{ flexGrow: 1, marginBottom: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
          }}
        >
          <thead>
            <tr style={{ borderTop: "1px solid black", borderBottom: "1px solid black" }}>
              <th style={verticalLineHeader}>Sr.</th>
              <th style={verticalLineHeader}>Description of Goods</th>
              <th style={verticalLineHeader}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={verticalLineCell}>{index + 1}</td>
                <td style={verticalLineCell}>{item.description}</td>
                <td style={verticalLineCell}>{item.qty}</td>
              </tr>
            ))}
            {/* Add empty rows to fill page */}
            {Array.from({ length: 25 - items.length }).map((_, i, arr) => {
              const isLastRow = i === arr.length - 1;
              return (
                <tr key={`empty-${i}`}>
                  <td style={{ ...verticalLineCell, borderBottom: isLastRow ? "1px solid black" : "none" }}>
                    &nbsp;
                  </td>
                  <td style={{ ...verticalLineCell, borderBottom: isLastRow ? "1px solid black" : "none" }}>
                    &nbsp;
                  </td>
                  <td style={{ ...verticalLineCell, borderBottom: isLastRow ? "1px solid black" : "none" }}>
                    &nbsp;
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>



    </div>
  );
};

const verticalLineHeader: React.CSSProperties = {
  fontSize: "10pt",
  padding: "6px",
  borderLeft: "1px solid black",
  borderRight: "1px solid black",
};

const verticalLineCell: React.CSSProperties = {
  fontSize: "9pt",
  padding: "6px",
  borderLeft: "1px solid black",
  borderRight: "1px solid black",
};

export default OrderPDF;

