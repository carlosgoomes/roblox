# Operação comercial da REALBUX

O vendedor confirmou os 121 produtos, as quantidades e os preços com 75% OFF. Os 121 checkouts foram cadastrados na conta Velani e seus valores foram conferidos com o catálogo, em centavos. Há 120 ativos; Conta Especial + Itens Exclusivos permanece inativo porque seu estoque no site é zero.

## Pagamento

public/velani-checkouts.js associa cada ID de produto ao link criado na Velani, ao preço conferido e ao estado de ativação. O catálogo só oferece o link se o produto tiver estoque, o checkout estiver ativo e seu preço corresponder ao preço promocional do site. Alterações de preço na Velani e no catálogo devem ser sincronizadas antes de publicar.

Cada link cobra uma unidade de um produto. O checkout do site explica que várias unidades ou produtos exigem pagamentos separados e mostra o valor unitário junto de cada botão. O total do carrinho não é enviado a um link individual. Os links abrem em uma nova aba; o carrinho permanece salvo e a navegação não é tratada como confirmação de pagamento.

Pix está habilitado. Cartão e boleto não foram ativados. A API pública da Velani informa mínimo de R$ 5,00 para transações via gateway; 32 produtos custam menos. O cadastro desses preços foi aceito, mas não foi criada cobrança real para confirmar se o limite também se aplica aos checkouts. Essa regra precisa ser confirmada com a Velani antes de anunciar vendas desses itens. Nenhum preço foi aumentado.

## Entrega manual

O vendedor informou que possui os produtos e os enviará manualmente ao e-mail do comprador após a confirmação do pagamento. A condição em public/store-policy.js aparece nos produtos, FAQ, termos e checkout.

Todos os checkouts exigem nome e e-mail. O campo de entrega da Velani contém uma mensagem informando o envio manual pelo vendedor; não contém credenciais, estoque digital ou um produto fictício. Antes de enviar o produto, o vendedor deve verificar a confirmação no painel Velani e usar o e-mail informado na compra. A mensagem automática da plataforma não substitui o envio do produto.

## Histórico e persistência

Cadastro, login e sessões usam Turso na Vercel. Pagamentos externos da Velani ainda não são sincronizados com o histórico local: não há webhook ou consulta autenticada de conciliação implementados. A interface informa ao comprador que acompanhe a confirmação na Velani e a entrega pelo e-mail.

POST /api/orders permanece indisponível para criar compras locais sem confirmação de pagamento. Registros antigos com status demo são preservados no banco e omitidos da resposta pública. Nenhum registro foi convertido em compra real ou apagado.

## Credenciais e validação

O token temporário da Velani é usado apenas para administração neste ambiente. Nenhuma credencial foi incluída no frontend, no Git ou no arquivo de links. Os testes de navegador interceptam o checkout externo e não geram cobranças.

O mínimo de cobrança e um pagamento real de ponta a ponta ainda precisam de validação operacional com a Velani. Sincronização automática de histórico, reserva de estoque e entrega automática de produtos não fazem parte deste fluxo de links individuais.
