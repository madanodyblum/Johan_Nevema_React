import React, {Component} from 'react'
import { connect } from 'react-redux';
import { Button, Form, Col, Row } from 'react-bootstrap';
import  Purchaseform  from './purchaseform'
import { BallBeat } from 'react-pure-loaders';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import 'datatables.net';
import $ from 'jquery';
import * as Common from '../../components/common';
import Purchaseorderdetail from './purchaseorder_detail';
import Filtercomponent from '../../components/filtercomponent';

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 

class Purchaseorder extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            purhaseorders:[],
            loading:true,
            slideFormFlag: false,
            slideDetailFlag: false,
            filterData: [],
            originpurchaseorders: [],
            filterFlag: false,
        };
      }
componentDidMount() {
    this.getPurchaseOrders();
    this.setFilterData();
}

componentWillUnmount() {
}
getPurchaseOrders(data) {
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetPurchaseOrders, headers)
    .then(result => {
        if(!data){
            this.setState({purhaseorders: result.data.Items, originpurchaseorders: result.data.Items});
        }else{
            this.setState({purhaseorders: data});
        }
        this.setState({loading:false})
        $('#example').dataTable().fnDestroy();
        $('#example').DataTable(
            {
                "language": {
                    "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                    "zeroRecords": "Nothing found - sorry",
                    "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                    "infoEmpty": "No records available",
                    "infoFiltered": "(filtered from _MAX_ total records)",
                    "search": trls('Search'),
                    "paginate": {
                    "previous": trls('Previous'),
                    "next": trls('Next')
                    }
                },
                "searching": false,
                "dom": 't<"bottom-datatable" lip>'
            }
        );
    });
}

loadPurchaseDetail = (id) =>{
    this.setState({newId: id, supplierCode: '', newSubmit: true, slideDetailFlag: true});
    Common.showSlideForm();
}

addPurchase = () => {
    this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
    Common.showSlideForm();
}
// filter module
setFilterData = () => {
    let filterData = [
        {"label": trls('Supplier'), "value": "Supplier", "type": 'text'},
        {"label": trls('Invoice'), "value": "invoicenr", "type": 'text'},
        {"label": trls('Invoice_date'), "value": "invoicedate", "type": 'date'},
        {"label": trls('Total_amount'), "value": "total", "type": 'text'}
    ]
    this.setState({filterData: filterData});
}

filterOptionData = (filterOption) =>{
    let dataA = []
    dataA = Common.filterData(filterOption, this.state.originpurchaseorders);
    if(!filterOption.length){
        dataA=null;
    }
    $('#example').dataTable().fnDestroy();
    this.getPurchaseOrders(dataA);
}

changeFilter = () => {
    if(this.state.filterFlag){
        this.setState({filterFlag: false})
    }else{
        this.setState({filterFlag: true})
    }
}
// filter module

render () {
    let salesData = this.state.purhaseorders;
    return (
        <div className="order_div">
            <div className="content__header content__header--with-line">
                <h2 className="title">{trls('Purchase_Order')}</h2>
            </div>
            <div className="orders">
                <Row>
                    <Col sm={6}>
                        <Button variant="primary" onClick={()=>this.addPurchase()}><i className="fas fa-plus add-icon"></i>{trls('Add_Pursase_Order')}</Button>  
                    </Col>
                    <Col sm={6} className="has-search">
                        <div style={{display: 'flex', float: 'right'}}>
                            <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>
                            <div style={{marginLeft: 20}}>
                                <span className="fa fa-search form-control-feedback"></span>
                                <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                            </div>
                        </div>
                    </Col>
                    {this.state.filterData.length&&(
                        <Filtercomponent
                            onHide={()=>this.setState({filterFlag: false})}
                            filterData={this.state.filterData}
                            onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                            showFlag={this.state.filterFlag}
                        />
                    )}
                </Row>
                <div className="table-responsive purchase-order-table">
                    <table id="example" className="place-and-orders__table table" width="100%">
                        <thead>
                            <tr>
                                <th>{trls('Id')}</th>
                                <th>{trls('Supplier')}</th>
                                <th>{trls('Invoice')}</th>
                                <th>{trls('Invoice_date')}</th>
                                <th>{trls('IsTransport')}</th>
                                <th>{trls('Total_amount')}</th>
                                
                            </tr>
                        </thead>
                        {salesData && !this.state.loading &&(<tbody>
                            {
                            salesData.map((data,i) =>(
                                <tr id={data.id} key={i}>
                                    <td>{data.id}</td>
                                    <td>
                                        <div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadPurchaseDetail(data.id)}>{data.Supplier}</div>
                                    </td>
                                    <td>{data.invoicenr}</td>
                                    <td>{Common.formatDate(data.invoicedate)}</td>
                                    <td>
                                        {data.istransport ? (
                                            <i className ="fas fa-check-circle active-icon"></i>
                                        ):
                                            <i className ="fas fa-check-circle inactive-icon"></i>
                                        }
                                    </td>
                                    <td>{Common.formatMoney(data.total)}</td>
                                </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    { this.state.loading&& (
                        <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                            <BallBeat
                                color={'#222A42'}
                                loading={this.state.loading}
                            />
                        </div>
                    )}
                </div>
            </div>
            {this.state.slideFormFlag ? (
                <Purchaseform
                    show={this.state.modalShow}
                    onHide={() => this.setState({slideFormFlag: false})}
                    onloadPurchaseDetail={(purchaseId) => this.loadPurchaseDetail(purchaseId)}
                />
            ): null}
            {this.state.slideDetailFlag ? (
                <Purchaseorderdetail
                    onHide={()=>this.setState({slideDetailFlag: false})}
                    newId={this.state.newId}
                    supplierCode={this.state.supplierCode}
                />
            ): null}
        </div>
    )
};
}
export default connect(mapStateToProps, mapDispatchToProps)(Purchaseorder);
