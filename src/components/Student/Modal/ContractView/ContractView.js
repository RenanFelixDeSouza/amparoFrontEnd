import React, { useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import logo from '../../../../img/logo-prefeitura/logomarca-oficial.png';

// Estilo global para impressão
const GlobalStyle = createGlobalStyle`
@media print {
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      color: black; 
    }
    .img {
      max-width: 100%;
    }
    button {
      display: none;
    }
    #contract {
      position: relative;
      width: 100%;
      min-height: 100vh; 
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      display: flex; 
      flex-direction: column; 
      color: black; 
    }
    #contract > .container { 
        flex: 1; 
    }
    @page {
      size: A4;
      margin: 20mm;
    }
  }
`;

// Componentes estilizados (CSS-in-JS)
const Contract = styled.div`
  font-family: 'Times New Roman', Times, serif;
  font-size: 10pt;
  
  line-height: 1.2;
  box-sizing: border-box;  
  width: 100%; 
  color: black; 
  
  @media print {
    margin: 0;
    padding: 0;
  }
`;

const Container = styled.div`
  max-width: 210mm;
  margin: 0 auto;
  color: black; 

  @media print {
  width: 100%;
  height: 100%;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 10px;
  color: black; 
`;

const HeaderImg = styled.img`
  max-width: 150px;
  height: auto;
  margin-bottom: 5px;

  @media print {
    max-width: 300px;
  }
`;

const Title = styled.h1`
  font-size: 14pt;
  margin-top: 5px;
  color: black; 
`;

const Subtitle = styled.h2`
  font-size: 12pt;
  margin-top: 3px;
  color: black; 
`;

const Section = styled.div`
  margin-bottom: 10px;
  color: black; 
`;

const Label = styled.span`
  font-weight: bold;
  color: black; 
`;


const InfoInline = styled.div`
  margin-bottom: 3px;
  color: black; 
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  color: black; 
`;

const Address = styled.div`
  grid-column: span 2;
  color: black; 
`;


const ResponsibleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  font-size: 8pt;
  color: black; 
`;

const ResponsibleTh = styled.th`
  border: 1px solid #000;
  padding: 4px;
  text-align: left;
  background-color: #e0e0e0;
  color: black; 
`;

const ResponsibleTd = styled.td`
  border: 1px solid #000;
  padding: 4px;
  text-align: left;
  color: black; 
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 8pt;
  color: black; 
`;



const CompactCheckboxItem = styled.div`
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  color: black; 
`;

const Checkbox = styled.input`
  margin-right: 5px;
`;

const CompactCheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 5px;
  color: black; 
`;

const PrintButton = styled.button`
  float: right;
  margin: 10px;
  background-color: var(--primary-color);
  color: #f4f2ef;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background-color: var(--hover-color);
  }
`;

// Função para formatar o número de telefone
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  phone = phone.replace(/\D/g, "");
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  } else if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

/**
 * Componente ContractView
 * Renderiza e permite impressão do contrato do aluno
 */
const ContractView = ({ student, polo, allCategory }) => {
  const contractRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!student || !polo || !allCategory) {
    return <div>Erro em carregar os dados...</div>;
  }

  const selectedCategories = student.categories.map(category => category.id);
  const sortedCategories = [
    ...allCategory.filter(category => selectedCategories.includes(category.id)),
    ...allCategory.filter(category => !selectedCategories.includes(category.id))
  ].slice(0, 20);

  return (
    <>
      <PrintButton onClick={handlePrint}>Imprimir</PrintButton>
      <GlobalStyle />

      <Contract id="contract" ref={contractRef}>
        <Container>
          <Header>
            <HeaderImg src={logo} alt="Logo" />
            <Title>Termo de Matrícula - Atividades Culturais</Title>
            {polo && <Subtitle>{polo.name}</Subtitle>}
          </Header>

          <Section>
            <Title>Dados do(a) Aluno(a)</Title>
            <InfoGrid>
              <InfoInline><Label>Nome:</Label> {student.first_name} {student.last_name}</InfoInline>
              <InfoInline><Label>Nascimento:</Label> {new Date(student.birthdate).toLocaleDateString('pt-BR')}</InfoInline>
              <InfoInline><Label>Gênero:</Label> {student.gender === 'male' ? 'Masculino' : 'Feminino'}</InfoInline>
              <InfoInline><Label>Telefone:</Label> {formatPhoneNumber(student.phone_number)}</InfoInline>
              <InfoInline><Label>Pai:</Label> {student.father_name || 'Não Informado'}</InfoInline>
              <InfoInline><Label>Mãe:</Label> {student.mother_name || 'Não Informado'}</InfoInline>
              <Address><Label>Endereço:</Label> {student.street || 'Não Informado'}, {student.number || 'Não Informado'} - {student.neighborhood || 'Não Informado'}, {student.city || 'Não Informado'} - {student.state || 'Não Informado'}, {student.zip_code || 'Não Informado'}</Address>
            </InfoGrid>
            {student.responsibles && student.responsibles.length > 0 ? (
              <>
                <Label>Responsáveis:</Label>
                <ResponsibleTable>
                  <thead>
                    <tr>
                      <ResponsibleTh>Nome</ResponsibleTh>
                      <ResponsibleTh>Parentesco</ResponsibleTh>
                      <ResponsibleTh>Telefone</ResponsibleTh>
                    </tr>
                  </thead>
                  <tbody>
                    {student.responsibles.map((responsible) => (
                      <tr key={responsible.id}>
                        <ResponsibleTd>{responsible.first_name} {responsible.last_name}</ResponsibleTd>
                        <ResponsibleTd>{responsible.relation || 'Não Informado'}</ResponsibleTd>
                        <ResponsibleTd>{formatPhoneNumber(responsible.phone_number)}</ResponsibleTd>
                      </tr>
                    ))}
                  </tbody>
                </ResponsibleTable>
              </>
            ) : (
              <Label>Responsável: Nenhum responsável cadastrado.</Label>
            )}
          </Section>

          <Section>
            <Title>Oficinas Cadastradas</Title>
            <CompactCheckboxGrid>
              {sortedCategories.map((course) => (
                <CompactCheckboxItem key={course.id}>
                  <Checkbox
                    type="checkbox"
                    checked={selectedCategories.includes(course.id)}
                    readOnly
                  />
                  <span>{course.name}</span>
                </CompactCheckboxItem>
              ))}
            </CompactCheckboxGrid>
          </Section>

          <Section>
            <Title>Termos e Condições</Title>
            <div>
              1. As aulas terão duração de 1 hora, duas vezes por semana, conforme horário estabelecido. <br />
              2. Não haverá reposição de aulas em caso de falta. <br />
              3. É obrigatória a assiduidade e o porte do material necessário. <br />
              4. Três faltas sem justificativa resultarão em advertência aos pais. <br />
              5. Pais/responsáveis são responsáveis pela guarda e transporte dos alunos. <br />
              6. Para oficinas de teatro, bateria, violão, teclado, fanfarra e flauta, é necessário saber ler. <br />
            </div>
            <Title>Autorização de Uso de Imagem</Title>
            <div>
              Eu, o(a) responsável pelo(a) aluno(a) acima identificado(a), autorizo o uso da imagem do(a)
              mesmo(a) para fins de divulgação das atividades culturais promovidas pela Secretaria de Cultura,
              incluindo fotos e vídeos, em materiais impressos, digitais e redes sociais.
            </div>
            <div>
              7. Este termo de matrícula é válido mediante assinatura do responsável.
            </div>
          </Section>

          <Footer>
            <p>
              _________________________________________<br />
              Assinatura do(a) Responsável
            </p>
          </Footer>
        </Container>
      </Contract>
    </>
  );
};

export default ContractView;