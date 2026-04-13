import React from "react"
import { masterDescriptors, pressureStatements } from "@/lib/descriptors"

type Category = "Generator" | "Reflector" | "Connector" | "Ignitor"

const PERSONALITY_IMAGES: Record<Category, string> = {
  Generator: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Generator-vd4zvm25BDcauDplOVQlAZwODDH1Mb.jpg",
  Reflector: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Reflector-ywren7q5424vZKNozqy7NioaDwqMU5.jpg",
  Connector: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Connector-pKiYtSsx5r0sVIarD3HLP7gWXoRuj5.jpg",
  Ignitor: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ignitor-P2Wa9VDihVDdMaAySZmJgPX0xv2f1q.jpg",
}

interface IlluminatePdfContainerProps {
  userName: string
  scores: Record<Category, number>
  userData: {
    name: string
    email: string
    company: string
    accessCode: string
  }
}

export const IlluminatePdfContainer = React.forwardRef<
  HTMLDivElement,
  IlluminatePdfContainerProps
>(({ userName, scores, userData }, ref) => {
  // Sort by score descending (highest first)
  const categories: Category[] = ["Generator", "Reflector", "Connector", "Ignitor"]
  const rankedCategories = [...categories].sort((a, b) => scores[b] - scores[a])
  
  const page1Categories = rankedCategories.slice(0, 2)
  const page2Categories = rankedCategories.slice(2, 4)

  const welcomeText = userData.name
    ? `Well done ${userData.name} on completing the assessment! Please bring this with you to your session later.`
    : "Well done on completing the assessment! Please bring this with you to your session later."

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-99999px",
        top: "-99999px",
        width: "210mm",
        height: "297mm",
        fontFamily: "'Montserrat', sans-serif",
        backgroundColor: "#000000",
        color: "#FFFFFF",
      }}
    >
      {/* ============= PAGE 1 ============= */}
      <div
        style={{
          width: "210mm",
          height: "297mm",
          padding: "20px",
          backgroundColor: "#000000",
          pageBreakAfter: "always",
          boxSizing: "border-box",
        }}
      >
        {/* Hero Banner with fade effect */}
        <div style={{ position: "relative", marginBottom: "40px" }}>
          <img
            src="/illuminate-banner.jpg"
            alt="Illuminate Banner"
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Fade overlay (bottom 20%) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "36px",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))",
            }}
          />
        </div>

        {/* Greeting bar */}
        <table width="100%" style={{ marginBottom: "40px", borderCollapse: "collapse" }}>
          <tbody>
            <tr style={{ backgroundColor: "#01A0B6" }}>
              <td
                style={{
                  padding: "16px 20px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {welcomeText}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Render top 2 preferences */}
        {page1Categories.map((category) => (
          <div key={category} style={{ marginBottom: "40px" }}>
            {/* Header row */}
            <table width="100%" style={{ marginBottom: "0", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#01A0B6",
                      fontSize: "20px",
                      fontWeight: "bold",
                      padding: "8px 0",
                    }}
                  >
                    {category}
                  </td>
                  <td
                    style={{
                      color: "#01A0B6",
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "right",
                      padding: "8px 0",
                    }}
                  >
                    {scores[category]}/40
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Content row */}
            <table width="100%" style={{ marginBottom: "0", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  {/* Left: Image (20%) */}
                  <td
                    width="20%"
                    style={{
                      verticalAlign: "top",
                      paddingRight: "16px",
                    }}
                  >
                    <img
                      src={PERSONALITY_IMAGES[category]}
                      alt={category}
                      style={{
                        width: "120px",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </td>
                  {/* Right: Descriptor (80%) */}
                  <td
                    width="80%"
                    style={{
                      verticalAlign: "top",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      lineHeight: "1.4",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {masterDescriptors[category]}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pressure bar */}
            <table width="100%" style={{ marginTop: "12px", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ backgroundColor: "#01A0B6" }}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "bold",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {pressureStatements[category]}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ============= PAGE 2 ============= */}
      <div
        style={{
          width: "210mm",
          height: "297mm",
          padding: "20px",
          backgroundColor: "#000000",
          boxSizing: "border-box",
        }}
      >
        {/* Header: Logo + Illuminate title */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Elev-8%20logo%20-%20white%20out%20version%20-%20high%20res%20%281%29-kIS8PyL2XRcc1d231K270P9NNzsA91.png"
            alt="Elev-8"
            style={{
              height: "40px",
              display: "inline-block",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              color: "#01A0B6",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Illuminate
          </div>
        </div>

        {/* Render bottom 2 preferences */}
        {page2Categories.map((category) => (
          <div key={category} style={{ marginBottom: "40px" }}>
            {/* Header row */}
            <table width="100%" style={{ marginBottom: "0", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#01A0B6",
                      fontSize: "20px",
                      fontWeight: "bold",
                      padding: "8px 0",
                    }}
                  >
                    {category}
                  </td>
                  <td
                    style={{
                      color: "#01A0B6",
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "right",
                      padding: "8px 0",
                    }}
                  >
                    {scores[category]}/40
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Content row */}
            <table width="100%" style={{ marginBottom: "0", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  {/* Left: Image (20%) */}
                  <td
                    width="20%"
                    style={{
                      verticalAlign: "top",
                      paddingRight: "16px",
                    }}
                  >
                    <img
                      src={PERSONALITY_IMAGES[category]}
                      alt={category}
                      style={{
                        width: "120px",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </td>
                  {/* Right: Descriptor (80%) */}
                  <td
                    width="80%"
                    style={{
                      verticalAlign: "top",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      lineHeight: "1.4",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {masterDescriptors[category]}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pressure bar */}
            <table width="100%" style={{ marginTop: "12px", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ backgroundColor: "#01A0B6" }}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "bold",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {pressureStatements[category]}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: "60px", fontSize: "11px", color: "#FFFFFF" }}>
          <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
            Flexing Your Approach
          </div>
          <div style={{ fontSize: "10px", lineHeight: "1.4", color: "#B3B3B3" }}>
            Great communication is about making a choice to positively impact every conversation by creating a sense of being
            alike. The best communicators pick up on clues and adjust their style accordingly. By understanding your dominant
            preferences and being aware of others, you can flex your approach to build stronger connections.
          </div>
          <div
            style={{
              marginTop: "24px",
              fontSize: "10px",
              color: "#666666",
              textAlign: "center",
            }}
          >
            hello@Elev-8.co.uk | 0333 404 8888
          </div>
          <div style={{ fontSize: "9px", color: "#666666", textAlign: "center", marginTop: "8px" }}>
            Powered by the Elev-8 behavioural preference model
          </div>
        </div>
      </div>
    </div>
  )
})

IlluminatePdfContainer.displayName = "IlluminatePdfContainer"
