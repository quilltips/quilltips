
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://quilltips.co';

export const QuilltipsEmail = ({
  message = 'You received a new tip!',
  cta = 'View Tip',
  ctaUrl = 'https://quilltips.co',
}: {
  message?: string;
  cta?: string;
  ctaUrl?: string;
}) => (
  <Html>
    <Head />
    <Preview>{message}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/lovable-uploads/logo_nav.png`}
            width="60"
            alt="Quilltips Logo"
            style={{ borderRadius: '8px', marginBottom: '12px' }}
          />
          <Text style={brandTitle}>Quilltips</Text>
          <Text style={brandTagline}>Helping authors get paid</Text>
          <Hr style={hr} />

          <Text style={paragraph}>{message}</Text>

          <Button style={button} href={ctaUrl}>
            {cta}
          </Button>

          <Text style={paragraph}>
            or visit <Link href="https://www.quilltips.co">www.quilltips.co</Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, reply to this email<br />
            or contact us at <Link href="mailto:hello@quilltips.co">hello@quilltips.co</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default QuilltipsEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: '0 auto',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '20px 0',
};

const paragraph = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center',
};

const brandTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0',
};

const brandTagline = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#FFD166',
  borderRadius: '999px',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
  margin: '20px auto',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center',
};
