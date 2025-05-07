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
        // width: "90%",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        // minHeight: "95vh", // take almost full page height
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
            <img src="/01.png" alt="Logo" style={{ width: "200px", height: "130px", objectFit: "contain"}} />
          </div>

          <div style={{ textAlign: "center", width: "100%",marginRight:'200px' }}>
            <h1 style={{ fontSize: "45px", margin: 0 }}>
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
            <div style={{ display: "flex", gap: '350px', marginBottom: "30px", textAlign: "left" }}>
              <h1 style={{ fontSize: '18px' }}><strong>Nanalal sweet & caterers</strong></h1>
              <p><strong>GST No.:</strong> 24ADUPB6867D1ZD</p>
            </div>
            <div style={{ display: "flex", gap: '430px', textAlign: "left" }}>
              <p>Mob. No.: 9825430600</p>
              <p>Ph. No.: 0261 2894442</p>
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Sr.</th>
              <th style={headerCellStyle}>Description of Goods</th>
              <th style={headerCellStyle}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={bodyCellStyle}>{index + 1}</td>
                <td style={bodyCellStyle}>{item.description}</td>
                <td style={bodyCellStyle}>{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const headerCellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "5px",
  fontSize: "10pt",
  backgroundColor: "#f0f0f0",
  textAlign: "center"
};

const bodyCellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "5px",
  fontSize: "9pt",
  textAlign: "center"
};

export default OrderPDF;

